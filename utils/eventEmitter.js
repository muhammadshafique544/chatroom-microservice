class EventEmitter {
    constructor() {
      this.events = {};
    }
  
    on(event, listener) {
        if (!this.events[event]) {
          this.events[event] = [];
        }
        this.events[event].push(listener);
      }
  
      emit(event, data) {
        if (this.events[event]) {
          this.events[event].forEach(listener => listener(data));
        } else {
          console.log(`No listeners registered for event: ${event}`);
        }
      }
      
  }
  
  module.exports = { EventEmitter };

  