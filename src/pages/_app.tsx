import { type AppType } from "next/app";
import React from "react";
import {ToastContainer} from 'react-toastify';
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism } from '@clerk/themes'

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: neobrutalism,
      }}
    >
      <div>
        <Component {...pageProps} />
        <ToastContainer autoClose={3000} pauseOnHover position="bottom-left" />
      </div>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);
