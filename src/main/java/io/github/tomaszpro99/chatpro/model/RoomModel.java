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
    private String session1;
    private String session2;
    public RoomModel() {}
    public int getId() { return id; }
    public String getUser1() { return user1; }
    public String getUser2() { return user2; }
    public String getSession1() { return session1; }
    public String getSession2() { return session2; }
    public boolean isFull2() { return full2; }
    public void setFull2(boolean full2) { this.full2 = full2; }
}