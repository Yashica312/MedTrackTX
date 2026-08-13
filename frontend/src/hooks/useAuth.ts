import { useMutation } from "@tanstack/react-query";

import {
  loginDoctor,
  type LoginRequest,
} from "../api/auth";

export function useLogin() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) =>
      loginDoctor(credentials),
  });
}