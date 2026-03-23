import React from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

const AuthGuard = ({ isAuth, redirectPath = "/login", children }) => {
    if (!isAuth) {
        return <Navigate to={redirectPath} replace={true} />
    }

    return children ? children : <Outlet />
}

export default AuthGuard