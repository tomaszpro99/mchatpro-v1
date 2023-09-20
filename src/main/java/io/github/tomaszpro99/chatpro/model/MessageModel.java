package io.github.tomaszpro99.chatpro.model;

public class MessageModel {
    private int id;
    private MessageType type;
    private String sender;
    private String content;
    public enum MessageType { CHAT, START, STOP}
    public int getId() { return id; }
    public void setId(final int id) { this.id = id; }
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
}