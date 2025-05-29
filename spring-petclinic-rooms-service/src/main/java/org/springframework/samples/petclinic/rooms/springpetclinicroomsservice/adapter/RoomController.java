package org.springframework.samples.petclinic.rooms.springpetclinicroomsservice.adapter;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.samples.petclinic.rooms.model.RoomRepository;
import org.springframework.samples.petclinic.rooms.model.dto.RoomDto;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:8080") // TODO: Remove if we use api gateway
@RequestMapping("/rooms")
@RestController
public class RoomController {

    private final RoomRepository roomRepository;

    @Autowired
    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @GetMapping
    public List<RoomDto> getAllRooms() {
        return roomRepository.findAll();
    }

    @GetMapping("/{id}")
    public RoomDto getRoom(@Valid @RequestParam Long id) {
        return roomRepository.findById(id).orElse(null);
    }

    @PostMapping
    public ResponseEntity<String> createRoom(@Valid @RequestBody RoomDto roomDto) {
        roomRepository.save(roomDto);
        return new ResponseEntity<>("Room created", HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@Valid @RequestParam Long id) {
        roomRepository.deleteById(id);
        return new ResponseEntity<>("Room deleted", HttpStatus.OK);
    }

    @ResponseStatus(HttpStatus.BAD_REQUEST)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public Map<String, String> handleValidationExceptions(
        MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return errors;
    }

}
