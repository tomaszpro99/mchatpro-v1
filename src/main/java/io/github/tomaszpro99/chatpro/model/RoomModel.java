package io.github.tomaszpro99.chatpro.model;
import jakarta.persistence.*;
@Entity
@Table(name = "room")
public class RoomModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String UID;
    private boolean wait = true;
    public RoomModel() {}
    public int getId() { return id; }
    public String getUID() { return UID; }
    public void setUID(String UID) {this.UID = UID;}
    public boolean getWait() { return wait; }
    public void setWait(boolean wait) { this.wait = wait; }
}