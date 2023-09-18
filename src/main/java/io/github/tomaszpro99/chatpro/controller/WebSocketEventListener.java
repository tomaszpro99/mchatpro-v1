package io.github.tomaszpro99.chatpro.controller;
import io.github.tomaszpro99.chatpro.repository.RoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Optional;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SimpMessageSendingOperations messagingTemplate;
    @Transactional
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {

        //TODO: niech uzytkownik wyślę tu swoj nick

        if (username != null) {
            // Wywołaj metodę do znalezienia pokoju o najniższym ID z full2=false
            Optional<Integer> optionalId = roomRepository.findMinRoomIdWithFull2False();

            if (optionalId.isPresent()) {
                Integer roomId = optionalId.get();
                // Znaleziono pokój - zaktualizuj z user2 i full2=true
                roomRepository.updateRoomWithUser2AndFull2True(roomId, username);
                // Wysłanie informacji do użytkownika o zaktualizowanym pokoju (tutaj używam loggera, ale możesz to dostosować)
                logger.info("[Room][Ful][" + roomId + "] " + username);
            } else {
                // Nie znaleziono pokoju - utwórz nowy z user1
                Integer newRoomId = roomRepository.createRoomWithUser1(username);
                // Wysłanie informacji do użytkownika o nowym pokoju (tutaj używam loggera, ale możesz to dostosować)
                logger.info("[Room][New][" + newRoomId + "] " + username);
            }
        }
    }
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {

        //TODO: niech uzytkownik wyślę tu id swojego pokoju

//        if(roomId != null) {
//            // Wywołaj operację usuwania pokoju o określonym ID
//            roomRepository.deleteById(Integer.parseInt(roomId));
//            logger.info("[Room][Del][" + roomId + "]");
//        }
    }
}

