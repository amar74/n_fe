interface ProposalProgressStepsProps {
  currentStep: number;
}

export function ProposalProgressSteps({ currentStep }: ProposalProgressStepsProps) {
  const steps = [
    { number: 1, label: 'Select Opportunity', completed: currentStep >= 1 },
    { number: 2, label: 'Proposal Development', completed: currentStep >= 2 },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold font-outfit ${
                step.completed
                  ? 'bg-[#161950] text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {step.number}
            </div>
            <span
              className={`text-sm font-medium font-outfit ${
                step.completed ? 'text-[#161950]' : 'text-gray-600'
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className="w-16 h-0.5 bg-gray-300 ml-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

