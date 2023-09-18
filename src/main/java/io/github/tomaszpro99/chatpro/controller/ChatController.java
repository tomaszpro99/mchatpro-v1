package io.github.tomaszpro99.chatpro.controller;

import io.github.tomaszpro99.chatpro.model.MessageModel;
import io.github.tomaszpro99.chatpro.model.RoomModel;
import io.github.tomaszpro99.chatpro.repository.RoomRepository;
import jakarta.validation.Valid;
import org.springframework.data.rest.webmvc.RepositoryRestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RepositoryRestController
public class ChatController {
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    private final RoomRepository repository;
    ChatController(final RoomRepository repository) {
        this.repository = repository;
    }
    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/room/{id}")
    public MessageModel sendMessage(@PathVariable int id, @Payload MessageModel chatMessage) {
        // TODO: wiadomosc bedzie dostarczona do pokoju w ktorym jest uzytkownik, klient ma wysylac wiadomośc, swoj nick, id pokoju
        return chatMessage;
    }
}

