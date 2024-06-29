package org.shamz.fileshare.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
public class SignalMessage {
    private String userId;
    @JsonProperty
    private JsonNode signal;
    @JsonProperty
    private JsonNode candidate;

    // Getters and Setters
}

