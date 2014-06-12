package com.github.mistertea.boardgame.landshark;

import java.io.FileInputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.thrift.TException;
import org.apache.thrift.protocol.TJSONProtocol;
import org.apache.thrift.protocol.TProtocol;
import org.apache.thrift.server.TServer;
import org.apache.thrift.server.TSimpleServer;
import org.apache.thrift.transport.TIOStreamTransport;
import org.apache.thrift.transport.TServerSocket;
import org.apache.thrift.transport.TServerTransport;
import org.apache.thrift.transport.TTransport;
import org.apache.thrift.transport.TTransportException;

public class GameServer implements LandsharkService.Iface {
  Map<String, Engine> gameEngines = new HashMap<>();
  private Board board;

  public GameServer() {
    board = new Board();
    try {
      TTransport trans = new TIOStreamTransport(
          new FileInputStream("Board.tft"));
      TProtocol prot = new TJSONProtocol(trans);
      board.read(prot);
      trans.close();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public String newGame(List<String> playerIds) throws TException {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public void addInput(String playerId, String inputData) throws TException {
    // TODO Auto-generated method stub

  }

  @Override
  public List<State> getStates(int startIndex) throws TException {
    // TODO Auto-generated method stub
    return null;
  }

  public static void main(String[] args) throws TTransportException {
    GameServer handler = new GameServer();
    LandsharkService.Processor<GameServer> processor = new LandsharkService.Processor<>(
        handler);
    TServerTransport serverTransport = new TServerSocket(9090);
    TServer server = new TSimpleServer(
        new TServer.Args(serverTransport).processor(processor));

    System.out.println("Starting the simple server...");
    server.serve();
  }
}
