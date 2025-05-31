package org.springframework.samples.petclinic.vets.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.samples.petclinic.vets.model.dto.RoomDto;

public interface RoomRepository extends JpaRepository<RoomDto, Long> {

}
