package io.github.tomaszpro99.chatpro.repository;

import io.github.tomaszpro99.chatpro.model.RoomModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;
@RepositoryRestResource
public interface RoomRepository extends JpaRepository<RoomModel, Integer> {
    List<RoomModel> findAll();
    Page<RoomModel> findAll(Pageable page);
    Optional<RoomModel> findById(Integer id);//chcemy tylko konkretny room
    boolean existsById(Integer id); //metoda z CrudRepository- czy dany id istnieje
    RoomModel save(RoomModel entity); //room do zapisania, stworzenia
    // Dodana metoda do wyszukiwania ID pokoju o najniższym ID z full2=false
    @Query("SELECT MIN(r.id) FROM RoomModel r WHERE r.full2 = false")
    Optional<Integer> findMinRoomIdWithFull2False();
    void deleteById(Integer id); // Usunięcie pokoju o określonym ID
    @Modifying
    @Query("UPDATE RoomModel r SET r.user2 = :user2, r.full2 = true WHERE r.id = :id")
    void updateRoomWithUser2AndFull2True(Integer id, String user2);
    @Modifying
    @Query(value = "INSERT INTO rooms (user1, full2) VALUES (:user1, false)", nativeQuery = true)
    Integer createRoomWithUser1(String user1);
}
