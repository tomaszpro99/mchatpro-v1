package io.github.tomaszpro99.chatpro.controller;

import io.github.tomaszpro99.chatpro.model.MessageModel;
import io.github.tomaszpro99.chatpro.repository.RoomRepository;
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


@Controller
public class ChatController {
    private final RoomRepository roomRepository;
    @Autowired
    public ChatController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);

    @MessageMapping("/chat.message/{id}")
    @SendTo("/topic/room/{id}")
    public MessageModel sendMessage(@Payload MessageModel chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String session = headerAccessor.getSessionId();
        String asd = headerAccessor.getSubscriptionId();
        logger.info(session + asd);
        return chatMessage;
    }
    @Transactional
    @MessageMapping("/search/{uid}")
    @SendTo("/topic/session/{uid}")
    public MessageModel start(@Payload MessageModel chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        String UID = chatMessage.getUID();
        Optional<Integer> roomIdOptional = roomRepository.findMinRoomIdWithWaitTrue();
        int RID;
        MessageModel responseMessage = new MessageModel();
        if (roomIdOptional.isPresent()) {
            RID = roomIdOptional.get();
            roomRepository.updateRoomWithWaitFalse(RID);
            logger.info("[Room][Add][" + RID + "]["+ UID +"]");
            responseMessage.setType(MessageModel.MessageType.JOIN);
        } else {
            roomRepository.createRoom(UID);
            RID = roomRepository.findRoomIdByUID(UID);
            logger.info("[Room][New][" + RID + "]["+ UID +"]");
            responseMessage.setType(MessageModel.MessageType.CREATE);
        }
        responseMessage.setRID(RID);
        responseMessage.setUID(UID);
        return responseMessage;
    }
    @MessageMapping("/disconnect")
    public MessageModel stop(@Payload MessageModel chatMessage) {
        int RID = chatMessage.getRID();
        roomRepository.deleteById(RID);
        logger.info("[Room][Del]["+RID+"]");
        return chatMessage;
    }
    @GetMapping("/regulamin")
    public String regulamin() {
        return "regulamin.html";
    }
}