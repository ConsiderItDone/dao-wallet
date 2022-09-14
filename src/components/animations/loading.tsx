import Lottie from "lottie-react";
import loadingAnimationData from "../../assets/animation/loading.json";

export const Loading = () => (
  <Lottie animationData={loadingAnimationData} loop={true} />
);
