import type { ChatEvents } from "@/types";
import { io } from "socket.io-client";

const PORT = 3333;
const URL = `ws://localhost:${PORT}`;

interface UseSocketParams {
  listeners: {
    [key in ChatEvents]?: (...args: any[]) => void;
  };
  emitOnConnect?: Array<{
    event: ChatEvents;
    data: unknown;
  }>;
}

const getUser = () => {
  const user = localStorage.getItem("user");
  if (user) {
    return JSON.parse(user).id;
  }
  return null;
};

export const useSocket = ({ emitOnConnect, listeners }: UseSocketParams) => {
  const socket = io(URL, {
    auth: {
      clientToken: getUser()
    }
  });

  socket.on("connect", () => {
    emitOnConnect?.forEach(f => socket.emit(f.event, f.data));

    Object.keys(listeners).forEach(event => {
      socket.on(event, listeners[event]);
    });
  });

  const typedEmit = (event: ChatEvents, data: any) => {
    socket.emit(event, data);
  };

  return { socket, typedEmit };
};
