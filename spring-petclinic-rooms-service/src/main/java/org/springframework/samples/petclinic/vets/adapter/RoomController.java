package org.springframework.samples.petclinic.vets.adapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.vets.model.RoomRepository;
import org.springframework.samples.petclinic.vets.model.dto.RoomDto;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequestMapping("/rooms")
@RestController
public class RoomController {

    private final RoomRepository roomRepository;

    @Value("${HOSTNAME:unknown}")
    private String hostname;

    @Autowired
    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public ResponseEntity<List<RoomDto>> getAllRooms() {
        return ResponseEntity.status(HttpStatus.OK).header("X-Pod-host", hostname).body(roomRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDto> getRoom(@PathVariable Long id) {
        if (id == null || id < 1) {
            return ResponseEntity.badRequest().body(null);
        }
        RoomDto room = roomRepository.findById(id).orElse(null);
        if (room == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).header("X-Pod-host", hostname).body(null);
        }
        return ResponseEntity.status(HttpStatus.OK).header("X-Pod-host", hostname).body((room));
    }

    @PostMapping
    public ResponseEntity<String> createRoom(@Valid @RequestBody RoomDto roomDto) {
        roomRepository.save(roomDto);
        return ResponseEntity.status(HttpStatus.CREATED).header("X-Pod-host", hostname).body("Room created");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        if (id == null || id < 1) {
            return ResponseEntity.badRequest().body("id must be a positive number");
        }
        if (!roomRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Room not found");
        }
        roomRepository.deleteById(id);
        return ResponseEntity.status(HttpStatus.OK).header("X-Pod-host" , hostname).body("Room deleted");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>>handleValidationExceptions(
        MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().header("X-Pod-host" , hostname).body(errors);
    }

}
