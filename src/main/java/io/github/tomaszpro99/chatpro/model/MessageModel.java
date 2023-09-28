package io.github.tomaszpro99.chatpro.model;

public class MessageModel {
    private int RID;
    private String UID;
    private MessageType type;
    private String sender;
    private String content;
    //private String SID;
    public enum MessageType { CHAT, CREATE, JOIN, LEAVE, STATUS, RECEIPT }
    public int getRID() { return RID; }
    public void setRID(final int RID) { this.RID = RID; }
    public String getUID() { return UID; }
    public void setUID(String UID) { this.UID = UID; }
    public MessageType getType() {
        return type;
    }
    public void setType(MessageType type) {
        this.type = type;
    }
    public String getContent() {
        return content;
    }
    public void setContent(String content) {
        this.content = content;
    }
    public String getSender() {
        return sender;
    }
    public void setSender(String sender) {
        this.sender = sender;
    }
    //public String getSID() { return SID; }
    //public void setSID(String SID) { this.SID = SID; }
}