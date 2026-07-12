"use client"

import {createContext,useContext , useMemo} from "react"
import { User } from "../types/types";

interface AppContextValue {
    user?: User
}

const AppContext = createContext<AppContextValue>({})

export const useAppContext = () => {
    return useContext(AppContext)
}

export const AppContextProvider = ({children, ...data}: AppContextValue & { children: React.ReactNode}) => {
    const contextValue = useMemo(
        () => ({
            ...data
        }), [data]
    )

    return (
        <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
    )
}