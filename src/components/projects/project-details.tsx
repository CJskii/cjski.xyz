import { ReactNode } from "react";

export const ProjectWrapper: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="container mx-auto px-4 md:px-8 pt-8 pb-8 min-h-[80vh]">
      <div className={`bg-accent rounded-lg p-6 shadow-md min-h-[80vh]`}>
        {children}
      </div>
    </div>
  );
};
