package io.github.tomaszpro99.chatpro.repository;

import io.github.tomaszpro99.chatpro.model.RoomModel;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;
@RepositoryRestResource
public interface RoomRepository extends JpaRepository<RoomModel, Integer> {
    List<RoomModel> findAll();
    Optional<RoomModel> findById(Integer id);//konkretny room
    boolean existsById(Integer id); //metoda z CrudRepository: czy dany id istnieje
    //RoomModel save(RoomModel entity); //room do zapisania, stworzenia
    @Query("SELECT MIN(r.id) FROM RoomModel r WHERE r.full2 = false")
    Optional<Integer> findMinRoomIdWithFull2False(); // wyszukiwania ID pokoju o najniższym ID z full2=false
    void deleteById(Integer id); // Usunięcie pokoju
    @Modifying
    @Query("UPDATE RoomModel r SET r.user2 = :user2, r.full2 = true WHERE r.id = :id")
    void updateRoomWithUser2AndFull2True(Integer id, String user2); // dodanie user2, full2=true
    @Modifying
    @Bean
    @Query(value = "INSERT INTO room (user1, user2, full2, session1, session2) VALUES (:user1, NULL, false, :session1, NULL)", nativeQuery = true)
    void createRoom(@Param("user1") String user1,@Param("session1") String session1);  //tworzenie cz1 - tworzenie, wysłanie nicku
    @Query(value = "SELECT max(id) FROM room", nativeQuery = true)
    Integer IDcreateRoom();                         //tworzenie cz2 - odebranie ID stworzonego pokoju
}