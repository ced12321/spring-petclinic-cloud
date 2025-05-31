package org.springframework.samples.petclinic.vets.model.dto;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.Instant;

@Entity
@Table(name = "rooms")
public class RoomDto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_name")
    @NotBlank(message = "The room name is mandatory and must not be blank")
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "room_type")
    @NotBlank(message = "The room type is mandatory and must not be blank")
    private RoomType roomType;

    @Column(name = "last_used")
    private Instant lastUsed;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public RoomType getRoomType() {
        return roomType;
    }

    public void setRoomType(RoomType roomType) {
        this.roomType = roomType;
    }

    public Instant getLastUsed() {
        return lastUsed;
    }

    public void setLastUsed(Instant lastUsed) {
        this.lastUsed = lastUsed;
    }
}
