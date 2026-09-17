import React from "react";
import { Route, Redirect } from "react-router-dom";
import { getToken, getUser, logSecurityEvent } from "../services/AuthService";

const PrivateRoute = ({ component: Component, allowedRoles, ...rest }) => {
  const token = getToken();
  const user = getUser();

  return (
    <Route
      {...rest}
      render={(props) => {
        // Check if user is logged in
        if (!token) {
          logSecurityEvent("UNAUTHORIZED_ACCESS_NO_TOKEN", `Attempted to access ${props.location.pathname} without token`);
          return <Redirect to="/login" />;
        }

        // Check if user has required role
        if (allowedRoles && allowedRoles.length > 0) {
          if (!allowedRoles.includes(user?.role)) {
            logSecurityEvent("UNAUTHORIZED_ACCESS_WRONG_ROLE", `User role: ${user?.role} attempted to access ${props.location.pathname} (required: ${allowedRoles.join(", ")})`);
            return <Redirect to="/unauthorized" />;
          }
        }

        // Log successful access
        logSecurityEvent("AUTHORIZED_ACCESS", `User role: ${user?.role} accessed ${props.location.pathname}`);

        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute;
