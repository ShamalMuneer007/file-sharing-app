package org.shamz.fileshare.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class RequestMessage {
    @JsonProperty
    private String toUser;
    @JsonProperty
    private String fromUser;
}