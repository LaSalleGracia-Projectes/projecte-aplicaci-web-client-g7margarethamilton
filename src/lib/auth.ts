export function getUserId() {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      return user.email || null;
    } catch {
      return null;
    }
  }
  
  export function getTokenWeb() {
    return localStorage.getItem("tokenWeb");
  }