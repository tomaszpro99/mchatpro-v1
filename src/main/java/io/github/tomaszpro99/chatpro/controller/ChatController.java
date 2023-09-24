package io.github.tomaszpro99.chatpro.controller;

import io.github.tomaszpro99.chatpro.model.MessageModel;
import io.github.tomaszpro99.chatpro.repository.RoomRepository;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.Optional;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;


@Controller
public class ChatController {
    private final SimpMessagingTemplate messagingTemplate;
    private final RoomRepository roomRepository;
    @Autowired
    public ChatController(RoomRepository roomRepository, SimpMessagingTemplate messagingTemplate) {
        this.roomRepository = roomRepository;
        this.messagingTemplate = messagingTemplate;
    }
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    @MessageMapping("/chat.message/{id}")
    @SendTo("/topic/room/{id}")
    public MessageModel sendMessage(@Payload MessageModel chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String session = headerAccessor.getSessionId();
        logger.info("[Room][Mes][" + session + "][" + chatMessage.getId() + "][" + chatMessage.getContent() + "]");
        return chatMessage;
    }
    @Transactional
    @MessageMapping("/room.start")
    @SendTo("/topic")
    public MessageModel start(@Payload MessageModel chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String session = headerAccessor.getSessionId();
        String username = chatMessage.getSender();
        Optional<Integer> roomIdOptional = roomRepository.findMinRoomIdWithFull2False();
        int roomId;
        MessageModel responseMessage = new MessageModel();
        responseMessage.setSender(username);
        if (roomIdOptional.isPresent()) {
            roomId = roomIdOptional.get();
            roomRepository.updateRoomWithUser2AndFull2True(roomId, username);
            logger.info("[Room][Add][" + roomId + "][" + username + "]["+ session +"]");
            responseMessage.setType(MessageModel.MessageType.JOIN);
        } else {
            roomRepository.createRoom(username,session);
            roomId = roomRepository.IDcreateRoom();
            logger.info("[Room][New][" + roomId + "][" + username + "]["+ session +"]");
            responseMessage.setType(MessageModel.MessageType.CREATE);
        }
        responseMessage.setId(roomId);
        responseMessage.setSession(session);
        return responseMessage;
    }
    @MessageMapping("/room.stop")
    public MessageModel stop(@Payload MessageModel chatMessage) {
        int ID = chatMessage.getId();
        roomRepository.deleteById(ID);
        logger.info("[Room][Del]["+ID+"]");
        return chatMessage;
    }
    @GetMapping("/regulamin")
    public String regulamin() {
        return "regulamin.html";
    }
}