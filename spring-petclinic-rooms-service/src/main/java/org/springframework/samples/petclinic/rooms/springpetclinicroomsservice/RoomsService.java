package org.springframework.samples.petclinic.rooms.springpetclinicroomsservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.samples.petclinic.rooms.system.RoomsProperties;

/**
 * @author Maciej Szarlinski
 */
@EnableDiscoveryClient
@SpringBootApplication
@EnableConfigurationProperties(RoomsProperties.class)
public class RoomsService {
    public static void main(String[] args) {
        SpringApplication.run(RoomsService.class, args);
    }
}
