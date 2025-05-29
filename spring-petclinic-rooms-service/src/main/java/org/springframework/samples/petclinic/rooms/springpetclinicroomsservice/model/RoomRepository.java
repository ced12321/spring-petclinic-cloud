package org.springframework.samples.petclinic.rooms.springpetclinicroomsservice.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.samples.petclinic.rooms.model.dto.RoomDto;

public interface RoomRepository extends JpaRepository<RoomDto, Long> {

}
