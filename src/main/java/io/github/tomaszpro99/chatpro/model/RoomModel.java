package io.github.tomaszpro99.chatpro.model;
import jakarta.persistence.*;
@Entity
@Table(name = "room")
public class RoomModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String user1;
    private String user2;
    private boolean full2 = false;
    public RoomModel() {}
    public int getId() { return id; }
    public void setId(final int id) { this.id = id; }
    public String getUser1() { return user1; }
    public void setUser1(final String user1) { this.user1 = user1; }
    public String getUser2() { return user2; }
    public void setUser2(final String user2) { this.user2 = user2; }
    public boolean isFull2() { return full2; }
    public void setFull2(boolean full2) { this.full2 = full2; }
    public void updateFrom(final RoomModel source) {
        id = source.id;
        user1 = source.user1;
        user2 = source.user2;
        full2 = source.full2;
    }
}