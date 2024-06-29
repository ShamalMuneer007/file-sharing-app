package org.shamz.fileshare.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.shamz.fileshare.model.RequestMessage;
import org.shamz.fileshare.model.SignalMessage;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

@Service
@Slf4j
@RequiredArgsConstructor
public class AppService {
    private  final SimpMessagingTemplate simpMessagingTemplate;
    private final Set<String> connectedUsers = ConcurrentHashMap.newKeySet();
    public void addUser(String userId){
        connectedUsers.add(userId);
        log.info("Online users : {}",connectedUsers);
        simpMessagingTemplate.convertAndSend("/topic/users",connectedUsers);
    }
    public void disconnectUser(String userId){
        if(!connectedUsers.contains(userId)) {
            log.warn("No such user with Id : {}",userId);
            return;
        }
        connectedUsers.remove(userId);
        simpMessagingTemplate.convertAndSend("/topic/users",connectedUsers);

    }

    public boolean checkIfUserIsConnected(String to) {
        return connectedUsers.contains(to);
    }

    public void sendPeerConnectionRequestMessage(String from, String to) {
        simpMessagingTemplate.convertAndSendToUser(to,"/queue/receive/request",from);
    }
    public void sendSignal(SignalMessage signalMessage){
        log.info("Sending signal to {}",signalMessage);
        simpMessagingTemplate.convertAndSendToUser(signalMessage.getUserId(),"/queue/receive/signal", signalMessage);
    }

    public void createConnection(RequestMessage requestMessage) {
        simpMessagingTemplate.convertAndSendToUser(requestMessage.getToUser(),"/queue/connect",requestMessage.getFromUser());
    }
}
