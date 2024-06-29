package org.shamz.fileshare.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.shamz.fileshare.service.AppService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@Slf4j
@RequiredArgsConstructor
public class AppController {
    private final AppService appService;
    @GetMapping("/connection/request/send")
    public ResponseEntity<?> sendRequest(@RequestParam("from") String from,@RequestParam("to") String to){
        if(!appService.checkIfUserIsConnected(to)){
            return ResponseEntity.badRequest().body("No such user is online");
        }
        appService.sendPeerConnectionRequestMessage(from,to);
        return ResponseEntity.ok().body("Request send successfully");
    }
}
