if (!response.ok) {
  setMessage(data.message || "OTP send nahi hua.");
  return;
}

setMessage("OTP aapke email par bhej diya gaya.");
setShowOtp(true);