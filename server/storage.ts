import { users, type User, type InsertUser, type NetworkDiagram, type InsertNetworkDiagram } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Network diagram methods
  getAllNetworkDiagrams(): Promise<NetworkDiagram[]>;
  getNetworkDiagram(id: number): Promise<NetworkDiagram | undefined>;
  createNetworkDiagram(diagram: InsertNetworkDiagram): Promise<NetworkDiagram>;
  updateNetworkDiagram(id: number, diagram: Partial<InsertNetworkDiagram>): Promise<NetworkDiagram | undefined>;
  deleteNetworkDiagram(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private networkDiagrams: Map<number, NetworkDiagram>;
  private userCurrentId: number;
  private diagramCurrentId: number;

  constructor() {
    this.users = new Map();
    this.networkDiagrams = new Map();
    this.userCurrentId = 1;
    this.diagramCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Network diagram methods
  async getAllNetworkDiagrams(): Promise<NetworkDiagram[]> {
    return Array.from(this.networkDiagrams.values());
  }
  
  async getNetworkDiagram(id: number): Promise<NetworkDiagram | undefined> {
    return this.networkDiagrams.get(id);
  }
  
  async createNetworkDiagram(insertDiagram: InsertNetworkDiagram): Promise<NetworkDiagram> {
    const id = this.diagramCurrentId++;
    const diagram: NetworkDiagram = { ...insertDiagram, id };
    this.networkDiagrams.set(id, diagram);
    return diagram;
  }
  
  async updateNetworkDiagram(id: number, updateData: Partial<InsertNetworkDiagram>): Promise<NetworkDiagram | undefined> {
    const existingDiagram = this.networkDiagrams.get(id);
    
    if (!existingDiagram) {
      return undefined;
    }
    
    const updatedDiagram = { ...existingDiagram, ...updateData };
    this.networkDiagrams.set(id, updatedDiagram);
    
    return updatedDiagram;
  }
  
  async deleteNetworkDiagram(id: number): Promise<boolean> {
    if (!this.networkDiagrams.has(id)) {
      return false;
    }
    
    return this.networkDiagrams.delete(id);
  }
}

export const storage = new MemStorage();
