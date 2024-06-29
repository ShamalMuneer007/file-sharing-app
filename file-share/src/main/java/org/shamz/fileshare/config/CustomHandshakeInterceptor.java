package org.shamz.fileshare.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Slf4j
public class CustomHandshakeInterceptor implements HandshakeInterceptor {


    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String userId = request.getURI().getQuery().split("userId=")[1];
        log.info("headers : {}",request.getHeaders());
        if (userId != null) {
            attributes.put("user-id", userId);
            log.info("User ID set in session attributes: " + userId);
        } else {
            log.warn("User ID not found in headers");
        }
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
       log.info("Request After Handshake {}",request.getHeaders());
    }
}
