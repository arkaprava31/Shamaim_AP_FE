import React, { createContext, useState } from 'react';

const AppContext = createContext();

const AppProvider = ({ children }) => {
    
    const [menuID, setMenuID] = useState(1);

    const handleMenuID = (id) => {
        setMenuID(id);
    }

    return (
        <AppContext.Provider
            value={{
                menuID,
                handleMenuID
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export { AppProvider, AppContext };
