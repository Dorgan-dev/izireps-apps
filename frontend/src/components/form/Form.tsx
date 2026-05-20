import { FC, ReactNode, FormEvent } from "react";

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

const Form: FC<FormProps> = ({ onSubmit, children, className }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">

      <form
        onSubmit={(event) => {
          event.preventDefault(); // Prevent default form submission
          onSubmit(event);
        }}
        className={` ${className}`} // Default spacing between form fields
      >
        {children}
      </form>
    </div>

  );
};

export default Form;
