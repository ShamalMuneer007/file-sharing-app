package org.shamz.fileshare.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.shamz.fileshare.service.AppService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventHandler {

    private final AppService appService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) throws InterruptedException {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = (String) accessor.getSessionAttributes().get("user-id");
        log.info("CONNECTION ESTABLISHED : {}",userId);
        if (userId != null) {
            log.info("User ID: {}", userId);
            appService.addUser(userId);
        }

    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) throws InterruptedException {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = (String) accessor.getSessionAttributes().get("userId");
        log.info("USER DISCONNECTED {}",accessor.getSessionAttributes());
        log.info("SESSIONS : {}",accessor.getSessionAttributes());
        if (userId != null) {
            appService.disconnectUser(userId);
            log.info("User disconnected: {}", userId);
        }
    }



}