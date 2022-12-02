import React, { ChangeEvent, useEffect, useState } from "react";
import { goTo } from "react-chrome-extension-router";
import "./index.css";
import { InputField } from "../form/inputField";
import { ClipLoader } from "react-spinners";
import { LocalStorage } from "../../services/chrome/localStorage";
import { hashPassword } from "../../utils/encryption";
import { HomePage } from "../index";

const CreatePasswordPage = () => {
  const [localStorage] = useState<LocalStorage>(new LocalStorage());

  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<
    string | null
  >(null);

  const [isSubmittingPassword, setIsSubmittingPassword] =
    useState<boolean>(false);

  useEffect(() => {
    const validatePassword = (password: string) => {
      if (!password) {
        setPasswordError(null);
        return;
      }

      if (password?.length < 6) {
        setPasswordError("Password should contain at least 6 characters");
        return;
      }

      setPasswordError(null);
    };

    validatePassword(password);
  }, [password]);

  useEffect(() => {
    const validateConfirmPassword = (confirmPassword: string) => {
      if (!confirmPassword) {
        setConfirmPasswordError(null);
        return;
      }

      if (confirmPassword !== password) {
        setConfirmPasswordError("Passwords do not match");
        return;
      }

      setConfirmPasswordError(null);
    };

    validateConfirmPassword(confirmPassword);
  }, [confirmPassword, password]);

  const onPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e?.target?.value);
  };
  const onConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e?.target?.value);
  };

  const handleCreatePassword = async () => {
    if (
      isSubmittingPassword ||
      !password ||
      !confirmPassword ||
      !!passwordError ||
      !!confirmPasswordError
    ) {
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const hashedPassword = hashPassword(password);
      await localStorage.setHashedPassword(hashedPassword);
      goTo(HomePage);
    } catch (error) {
      console.error("[HandleCreatePassword]:", error);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="createPasswordContainer">
      <div className="title">Create Password</div>
      <div className="formContainer">
        <InputField
          fieldLabel="Password"
          fieldName="password"
          placeholder="Enter password"
          value={password}
          inputType="password"
          onChange={onPasswordChange}
          error={passwordError}
          disabled={isSubmittingPassword}
          containerClassname="passwordContainer"
          inputClassname="password"
        />
        <InputField
          fieldLabel="Confirm Password"
          fieldName="confirmPassword"
          placeholder="Repeat password"
          value={confirmPassword}
          inputType="password"
          onChange={onConfirmPasswordChange}
          error={confirmPasswordError}
          disabled={isSubmittingPassword}
          containerClassname="confirmPasswordContainer"
          inputClassname="password"
        />
        <button
          onClick={handleCreatePassword}
          type="button"
          className="submitButton"
          disabled={
            isSubmittingPassword ||
            !password ||
            !confirmPassword ||
            !!passwordError ||
            !!confirmPasswordError
          }
        >
          {isSubmittingPassword ? (
            <ClipLoader color="#fff" size={14} />
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </div>
  );
};

export default CreatePasswordPage;
