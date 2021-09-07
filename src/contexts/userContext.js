import React, {createContext, useState} from "react"


let initialData = {  user: null, setUser: (newData) => {}}

const UserContext = createContext(initialData)

export default UserContext



export function UserContextProvider({children}) {

    const [user, setUser] = useState(null)

    return (
        <UserContext.Provider value={{user, setUser }}>
            {children}
        </UserContext.Provider>
    )

}
