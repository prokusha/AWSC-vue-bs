class WebSocketService {
    constructor(url) {
        this.url = url;
        this.socket = null;
        this.listeners = [];
    }
  
    connect() {
        this.socket = new WebSocket(this.url);
    
        this.socket.onopen = () => {
            console.log('WebSocket соединение установлено');
        };
    
        this.socket.onmessage = (event) => {
            this.listeners.forEach((listener) => listener(event.data));
        };
    
        this.socket.onclose = () => {
            console.log('WebSocket соединение закрыто');
        };
    
        this.socket.onerror = (error) => {
            console.error('WebSocket ошибка:', error);
        };
    }
  
    send(type, data = {}) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = { type: type, ...data };
            this.socket.send(JSON.stringify(message));
        } else {
            console.error('WebSocket не открыт');
        }
    }
  
    addListener(listener) {
        this.listeners.push(listener);
    }
  
    removeListener(listener) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }
}

const websocketService = new WebSocketService('ws://localhost:9002');

export default websocketService;
  