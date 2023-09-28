package io.github.tomaszpro99.chatpro.repository;

import io.github.tomaszpro99.chatpro.model.RoomModel;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import javax.swing.text.html.parser.Entity;
import java.util.List;
import java.util.Optional;
@RepositoryRestResource
public interface RoomRepository extends JpaRepository<RoomModel, Integer> {
    List<RoomModel> findAll();
    Optional<RoomModel> findById(Integer id);//konkretny room
    boolean existsById(Integer id); //metoda z CrudRepository: czy dany id istnieje
    //RoomModel save(RoomModel entity); //room do zapisania, stworzenia
    @Query("SELECT MIN(r.id) FROM RoomModel r WHERE r.wait = true")
    Optional<Integer> findMinRoomIdWithWaitTrue();
    void deleteById(Integer id); // Usunięcie pokoju
    @Modifying
    @Query("UPDATE RoomModel r SET r.wait = false WHERE r.id = :id")
    void updateRoomWithWaitFalse(Integer id);
    @Modifying
    @Query(value = "INSERT INTO room (UID, wait) VALUES (:UID, true)", nativeQuery = true)
    void createRoom(@Param("UID") String UID);
    @Query(value = "SELECT id FROM RoomModel WHERE UID = :UID")
    Integer findRoomIdByUID(@Param("UID") String UID);
}