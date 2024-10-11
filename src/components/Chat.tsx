
  if (lastMessage && lastMessage.role === 'assistant') {
    if (lastMessage.content.includes('Counter triggered')) {
      // Simulating counter trigger
      console.log('Counter triggered');
      // Add your counter trigger logic here
    } else if (lastMessage.content.includes('Counter incremented')) {
      // Simulating counter increment
      console.log('Counter incremented');
      // Add your counter increment logic here
    }
  }
}, [messages]);


const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (inputValue.trim()) {
    const lowerCaseInput = inputValue.toLowerCase().trim();
    if (lowerCaseInput === 'trigger counter' || lowerCaseInput === 'increment counter') {
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'user', content: inputValue },
      ]);
    }
    setInputValue('');
  }
};


    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: 'Debug: Increment Counter' },
    ]);
  }
};
