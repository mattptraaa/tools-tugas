import React from "react";
import { QuillBotCheckerTab } from "./QuillBotCheckerTab";

interface ZeroGPTCheckerTabProps {
  initialText?: string;
}

// Re-export QuillBotCheckerTab for backward compatibility
export const ZeroGPTCheckerTab: React.FC<ZeroGPTCheckerTabProps> = (props) => {
  return <QuillBotCheckerTab {...props} />;
};
