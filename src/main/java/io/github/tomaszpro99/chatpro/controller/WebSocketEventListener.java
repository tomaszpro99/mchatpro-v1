package io.github.tomaszpro99.chatpro.controller;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import org.slf4j.Logger;

@Component
public class WebSocketEventListener {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) { logger.info("connect"); }
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {logger.info("disconect");}
}