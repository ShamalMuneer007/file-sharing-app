package org.shamz.fileshare.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.shamz.fileshare.model.RequestMessage;
import org.shamz.fileshare.model.SignalMessage;
import org.shamz.fileshare.service.AppService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

@Controller
@Slf4j
@RequiredArgsConstructor
public class WebSocketController {
    private final AppService appService;

    @MessageMapping("/signal")
    public void handleSignal(@Payload SignalMessage signalMessage) {
        log.info("Handling peer connection signal to user {}",signalMessage.getUserId());
        appService.sendSignal(signalMessage);
    }
    @MessageMapping("/connection")
    public void createConnection(@Payload RequestMessage requestMessage){
        log.info("Creating connection between {}",requestMessage);
        appService.createConnection(requestMessage);
    }
}
