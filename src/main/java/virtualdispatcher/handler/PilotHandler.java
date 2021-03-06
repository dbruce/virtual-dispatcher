package virtualdispatcher.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import virtualdispatcher.api.Pilot;
import virtualdispatcher.db.dao.PilotDAO;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class PilotHandler extends TextWebSocketHandler {
    private List<WebSocketSession> sessions = new ArrayList<WebSocketSession>();

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PilotDAO pilotDAO;

    private String dataString = "";

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        sendServices(session);
    }

    private void sendServices(WebSocketSession session) throws IOException {
        session.sendMessage(new TextMessage(dataString));
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    @Scheduled(fixedRate = 1000)
    public void fetch() throws IOException {
        List<Pilot> pilots = pilotDAO.list();
        String newData = objectMapper.writeValueAsString(pilots);

        if(!newData.equals(this.dataString)){
            this.dataString = newData;

            for(Iterator<WebSocketSession> iterator = sessions.iterator(); iterator.hasNext(); ){
                WebSocketSession session = iterator.next();
                sendServices(session);
            }
        }
    }
}
