package io.github.tomaszpro99.chatpro.controller;

import io.github.tomaszpro99.chatpro.model.MessageModel;
import io.github.tomaszpro99.chatpro.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;

import java.util.Optional;

@Controller
public class ChatController<id> {
    private final RoomRepository roomRepository;
    @Autowired
    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    @MessageMapping("/chat.message")
    @SendTo("/topic/room/")
    public MessageModel sendMessage(@Payload MessageModel chatMessage) {
        logger.info("[Room][Mes]["+chatMessage.getId()+"]["+chatMessage.getContent()+"]");
        return chatMessage;
    }
    @Transactional
    @MessageMapping("/room.start")
    @SendTo("/topic")
    public MessageModel start(@Payload MessageModel chatMessage) {
        // Pobierz nick użytkownika
        String username = chatMessage.getSender();

        // Sprawdź, czy istnieje pokój z wolnym miejscem
        Optional<Integer> roomIdOptional = roomRepository.findMinRoomIdWithFull2False();
        int roomId;

        if (roomIdOptional.isPresent()) {
            // Jeśli istnieje pokój z wolnym miejscem, dołącz do niego
            roomId = roomIdOptional.get();
            roomRepository.updateRoomWithUser2AndFull2True(roomId, username);
            logger.info("[Room][Add][" + roomId + "][" + username + "]");
        } else {
            // Jeśli nie ma pokoju z wolnym miejscem, utwórz nowy pokój
            roomRepository.createRoom(username);
            roomId = roomRepository.IDcreateRoom();


            roomRepository.createRoom(username);
            logger.info("[Room][New][" + roomId + "][" + username + "]");
        }

        // Odpowiedz użytkownikowi z ID pokoju
        MessageModel responseMessage = new MessageModel();
        responseMessage.setType(MessageModel.MessageType.START);
        responseMessage.setId(roomId);  // Przekaż ID pokoju użytkownikowi

        return responseMessage;
    }

    @MessageMapping("/room.stop")
    public MessageModel stop(@Payload MessageModel chatMessage) {
        int ID = chatMessage.getId();
        roomRepository.deleteById(ID);
        logger.info("[Room][Del]["+ID+"]");
        return chatMessage;
    }
}

