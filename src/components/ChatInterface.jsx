'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatInterface({ conversationId, onConversationChange }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'What role do you want to progress to?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [playlistIdeas, setPlaylistIdeas] = useState([]);
  const [isInitialState, setIsInitialState] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [githubProfile, setGithubProfile] = useState(null);
  const carouselRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Set initial position on first render
  useEffect(() => {
    if (chatContainerRef.current && isInitialState) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [isInitialState]);
  
  // Load existing conversation if ID is provided
  useEffect(() => {
    if (conversationId) {
      loadConversation(conversationId);
    } else {
      // Reset to initial state for new conversation
      setMessages([{ role: 'assistant', content: 'What role do you want to progress to?' }]);
      setIsInitialState(true);
      setPlaylist(null);
      setPlaylistIdeas([]);
      setGithubProfile(null);
    }
  }, [conversationId]);

  const loadConversation = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.conversation.messages);
        setIsInitialState(false);
        
        // Extract playlist data if it exists
        const playlistMessage = data.conversation.messages.find(m => m.type === 'playlist');
        if (playlistMessage) {
          setPlaylist(playlistMessage.content);
        }
        
        const ideasMessage = data.conversation.messages.find(m => m.type === 'playlist-ideas');
        if (ideasMessage) {
          setPlaylistIdeas(ideasMessage.content);
        }
        
        // Extract GitHub profile data if it exists
        const githubMessage = data.conversation.messages.find(m => m.type === 'github-profile');
        if (githubMessage) {
          setGithubProfile(githubMessage.content);
        }
      } else {
        setError('Failed to load conversation');
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };
  
  const saveConversation = async (msgs) => {
    try {
      setIsSaving(true);
      
      // For new conversations, create a new entry
      if (!conversationId) {
        // Extract the role from the first user message
        const userMsg = msgs.find(m => m.role === 'user');
        const title = userMsg ? `${userMsg.content.substring(0, 30)}${userMsg.content.length > 30 ? '...' : ''}` : 'New Conversation';
        
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            messages: msgs
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Notify parent about the new conversation
          onConversationChange(data.conversation.id);
        }
      } else {
        // For existing conversations, update it
        await fetch(`/api/conversations/${conversationId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: msgs
          }),
        });
      }
    } catch (err) {
      console.error('Error saving conversation:', err);
      // We don't show an error to the user here to avoid disrupting the chat experience
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // No longer in initial state once user sends a message
    setIsInitialState(false);

    // Add user message to chat
    const userMessage = { role: 'user', content: inputValue };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // If this is the user's first message (their desired role)
      if (messages.length === 1) {
        const desiredRole = inputValue.trim();
        
        // Make API call to generate playlist based on user's desired role
        const response = await fetch('/api/generate-playlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ theme: desiredRole }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate playlist');
        }

        const data = await response.json();
        
        // Extract video titles for the playlist ideas
        const ideas = data.videos.map(video => video.title);
        setPlaylistIdeas(ideas);
        setPlaylist(data);

        // Create messages array with playlist data
        const messagesWithPlaylist = [
          ...updatedMessages, 
          { 
            role: 'assistant', 
            content: `Here's how to help you become a ${desiredRole}:` 
          },
          {
            role: 'assistant',
            type: 'playlist-ideas',
            content: ideas
          },
          {
            role: 'assistant',
            type: 'playlist',
            content: data
          },
          {
            role: 'assistant',
            content: 'To provide more personalized recommendations, I can analyze your GitHub profile. What is your GitHub username?'
          }
        ];
        
        // Set messages state
        setMessages(messagesWithPlaylist);
        
        // Save conversation to database
        saveConversation(messagesWithPlaylist);
      } 
      // If the user is providing their GitHub username (after the playlist)
      else if (messages.length > 4 && messages[messages.length - 1].content.includes('GitHub username') && !githubProfile) {
        const username = inputValue.trim();
        const loadingMessage = { role: 'assistant', content: 'Analyzing your GitHub profile...' };
        
        // Get the user's desired role from their first message
        const userFirstMessage = messages.find(m => m.role === 'user');
        const desiredRole = userFirstMessage ? userFirstMessage.content.trim() : '';
        
        // Show loading message
        setMessages([...updatedMessages, loadingMessage]);
        
        try {
          // Fetch GitHub profile
          const response = await fetch('/api/github', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
          });
          
          const data = await response.json();
          
          if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to fetch GitHub profile');
          }
          
          const profile = data.profile;
          setGithubProfile(profile);
          
          // Get playlist content to reference in the advice
          const playlistIdeas = messages.find(m => m.type === 'playlist-ideas')?.content || [];
          
          // Generate personalized advice incorporating playlist references
          const personalizedAdvice = getPersonalizedAdviceWithPlaylist(profile, desiredRole, playlistIdeas);
          
          // Update messages with GitHub profile and advice
          const messagesWithGitHub = [
            ...updatedMessages.slice(0, -1), // Remove loading message
            {
              role: 'assistant',
              type: 'github-profile',
              content: profile
            },
            {
              role: 'assistant',
              content: `Thanks for sharing your GitHub profile! Based on your experience with ${profile.insights.primaryLanguages.join(', ')}, here are some personalized recommendations for your journey to becoming a ${desiredRole} that build on the learning resources I recommended earlier:`
            },
            {
              role: 'assistant',
              content: personalizedAdvice
            }
          ];
          
          setMessages(messagesWithGitHub);
          saveConversation(messagesWithGitHub);
        } catch (error) {
          console.error('Error fetching GitHub profile:', error);
          // Show error message
          const errorMessages = [
            ...updatedMessages.slice(0, -1), // Remove loading message
            { role: 'assistant', content: `Sorry, I couldn't find that GitHub username. Please try again or type "skip" to continue without GitHub analysis.` }
          ];
          setMessages(errorMessages);
          saveConversation(errorMessages);
        }
      }
      // If user types "skip" after being asked for GitHub username
      else if (messages.length > 4 && messages[messages.length - 1].content.includes('GitHub username') && inputValue.toLowerCase() === 'skip') {
        // Get the user's desired role from their first message
        const userFirstMessage = messages.find(m => m.role === 'user');
        const desiredRole = userFirstMessage ? userFirstMessage.content.trim() : '';
        
        const skipMessages = [
          ...updatedMessages,
          { role: 'assistant', content: `No problem! If you have any specific questions about becoming a ${desiredRole}, feel free to ask.` }
        ];
        setMessages(skipMessages);
        saveConversation(skipMessages);
      }
      // For any other message after GitHub analysis or skip
      else {
        // Get the user's desired role from their first message
        const userFirstMessage = messages.find(m => m.role === 'user');
        const desiredRole = userFirstMessage ? userFirstMessage.content.trim() : '';
        
        const responseMessages = [
          ...updatedMessages,
          { role: 'assistant', content: `I hope the resources and advice help with your goal of becoming a ${desiredRole}. Is there anything specific you'd like to know more about?` }
        ];
        setMessages(responseMessages);
        saveConversation(responseMessages);
      }
      
      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error in conversation flow:', error);
      const errorMessages = [
        ...updatedMessages,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ];
      
      setMessages(errorMessages);
      saveConversation(errorMessages);
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };


  
  // Function to generate personalized advice based on GitHub profile and desired role
  const getPersonalizedAdvice = (profile, desiredRole) => {
    const languages = profile.insights.primaryLanguages;
    const focusAreas = profile.insights.focusAreas;
    const contributionLevel = profile.insights.contributionLevel;
    
    // Build a comprehensive advice message with multiple points
    let advice = [];
    
    // Personalized advice based on profile and role
    if (desiredRole.toLowerCase().includes('frontend') || desiredRole.toLowerCase().includes('front-end')) {
      if (languages.includes('JavaScript') || languages.includes('TypeScript')) {
        advice.push("Your experience with JavaScript/TypeScript is a great foundation for frontend development. To reach the next level, master modern frameworks like React, Vue, or Angular if you haven't already.");
        advice.push("Build responsive and accessible UI components to showcase your frontend skills.");
        advice.push("Learn about performance optimization techniques for web applications.");
      } else {
        advice.push("To transition to frontend development, start by learning JavaScript, HTML, and CSS fundamentals.");
        advice.push("Build small projects to practice your skills, then move to learning a framework like React.");
        advice.push("Take advantage of online learning platforms with interactive frontend courses.");
      }
    } else if (desiredRole.toLowerCase().includes('backend') || desiredRole.toLowerCase().includes('back-end')) {
      if (languages.includes('Python') || languages.includes('Java') || languages.includes('Go') || languages.includes('C#')) {
        advice.push(`Your experience with ${languages.join(', ')} is valuable for backend development. Focus on API design, database architecture, and server optimization.`);
        advice.push("Consider learning about microservices architecture and container technologies like Docker and Kubernetes.");
        advice.push("Implement security best practices in your backend applications.");
      } else {
        advice.push("For backend development, consider learning languages like Python, Java, Node.js, or Go based on your interests and job market.");
        advice.push("Study database technologies (both SQL and NoSQL) and API design patterns.");
        advice.push("Get comfortable with server infrastructure, deployment processes, and basic DevOps principles.");
      }
    } else if (desiredRole.toLowerCase().includes('fullstack') || desiredRole.toLowerCase().includes('full-stack')) {
      advice.push(`With your background in ${languages.join(', ')}, continue building projects that combine frontend and backend technologies.`);
      advice.push("Develop end-to-end applications that demonstrate your ability to work across the entire stack.");
      advice.push("Learn about different architectural patterns for web applications and when to apply them.");
    } else if (desiredRole.toLowerCase().includes('data scientist') || desiredRole.toLowerCase().includes('data science')) {
      if (languages.includes('Python') || languages.includes('R')) {
        advice.push("Your programming background puts you in a good position for data science. Focus on strengthening your skills in statistics, machine learning algorithms, and data visualization.");
        advice.push("Practice working with real-world datasets and participate in data science competitions like those on Kaggle.");
        advice.push("Learn about deploying machine learning models to production environments.");
      } else {
        advice.push("To transition to data science, start by learning Python and essential libraries like NumPy, Pandas, Scikit-learn, and TensorFlow/PyTorch.");
        advice.push("Take courses on statistics, probability, and machine learning fundamentals.");
        advice.push("Work on personal projects analyzing datasets in areas that interest you to build your portfolio.");
      }
    } else if (desiredRole.toLowerCase().includes('devops') || desiredRole.toLowerCase().includes('sre')) {
      advice.push("Focus on learning cloud platforms (AWS, Azure, GCP), infrastructure as code, and CI/CD pipelines.");
      advice.push("Develop skills in containerization (Docker) and orchestration (Kubernetes).");
      advice.push("Learn monitoring, observability, and incident response processes.");
    } else if (desiredRole.toLowerCase().includes('mobile')) {
      if (languages.includes('Swift') || languages.includes('Kotlin') || languages.includes('Java')) {
        advice.push("Continue developing native mobile applications with modern architectural patterns.");
        advice.push("Learn about advanced topics like performance optimization, offline functionality, and security.");
      } else {
        advice.push("Consider learning React Native or Flutter for cross-platform development, or Swift/Kotlin for native development.");
        advice.push("Build simple mobile apps to understand mobile UI/UX principles and deployment processes.");
      }
    } else {
      // Generic advice for any tech role
      advice.push(`Focus on building projects that demonstrate your skills in ${desiredRole} technologies.`);
      advice.push("Contribute to open source projects to gain experience and visibility in the community.");
      advice.push("Network with professionals in your desired field through meetups, conferences, and online communities.");
    }
    
    // Add advice based on contribution level
    if (contributionLevel === 'Getting Started') {
      advice.push("Increase your GitHub activity by contributing to open source projects and sharing more of your work publicly.");
      advice.push("Create a GitHub profile README to showcase your skills and interests.");
    } else if (contributionLevel === 'Highly Active') {
      advice.push("Your active GitHub profile shows dedication. Consider mentoring others or maintaining an open source project.");
      advice.push("Document your expertise through technical blog posts or talks to build your professional brand.");
    }
    
    // Add specific action items based on their specific GitHub insights
    if (profile.insights.developmentSuggestions.length > 0 && 
        profile.insights.developmentSuggestions[0] !== 'Your GitHub profile looks great!') {
      advice.push("Based on your GitHub profile, consider these improvements: " + 
        profile.insights.developmentSuggestions.join(', ').toLowerCase() + ".");
    }
    
    // Format advice as numbered list
    return advice.map((point, index) => `${index + 1}. ${point}`).join('\n\n');
  };

  // Function to generate personalized advice incorporating playlist references
  const getPersonalizedAdviceWithPlaylist = (profile, desiredRole, playlistIdeas) => {
    const languages = profile.insights.primaryLanguages;
    const focusAreas = profile.insights.focusAreas;
    const contributionLevel = profile.insights.contributionLevel;
    
    let advice = [];
    
    // Find relevant topics from the playlist that match the user's experience
    const relevantTopics = findRelevantTopics(playlistIdeas, languages, desiredRole);
    const relevantCourses = relevantTopics.length > 0 ? relevantTopics : playlistIdeas;
    
    // Create a more structured response with sections
    
    // SECTION 1: Introduction with personalized context
    if (desiredRole.toLowerCase().includes('python') && desiredRole.toLowerCase().includes('developer')) {
      if (languages.includes('Python')) {
        advice.push(`Your existing Python experience is a great foundation. From the resources I shared, focus particularly on these key areas to advance to a senior level:`);
        
        // Create a list of the most relevant resources with specific benefits
        let resourceList = [
          `"${findTopicByKeyword(playlistIdeas, 'design pattern')}" - This will help you write more maintainable, scalable code`,
          `"${findTopicByKeyword(playlistIdeas, 'optimization')}" - Essential for performance-critical Python applications`,
          `"${findTopicByKeyword(playlistIdeas, 'maintainable')}" - Critical for senior roles where code quality is expected`
        ];
        
        advice.push(resourceList.map(item => `• ${item}`).join('\n'));
      } else {
        advice.push(`While Python isn't prominent in your GitHub profile, your experience with ${languages.join(', ')} provides transferable skills. Focus on these resources to build Python expertise:`);
        
        // Recommended path for non-Python developers
        let resourceList = relevantCourses.slice(0, 3).map(course => `• "${course}"`);
        advice.push(resourceList.join('\n'));
      }
    } else {
      // Generic introduction for other roles
      advice.push(`Based on your GitHub profile showing experience with ${languages.join(', ')}, here's how to leverage these skills on your journey to becoming a ${desiredRole}:`);
      
      // Top recommended resources
      let topResources = relevantCourses.slice(0, Math.min(3, relevantCourses.length))
        .map(course => `• "${course}"`);
      advice.push(topResources.join('\n'));
    }
    
    // SECTION 2: Skill alignment section
    advice.push(`**Skill Alignment**\nYour GitHub experience aligns particularly well with these learning resources:`);
    
    const alignedTopics = findAlignedTopics(languages, playlistIdeas);
    advice.push(alignedTopics.map(topic => `• "${topic}"`).join('\n'));
    
    // SECTION 3: Action plan with clear steps
    advice.push(`**Action Plan**\nTo make the most of these resources and advance toward being a ${desiredRole}:`);
    
    const actionItems = [
      `Build a portfolio project demonstrating concepts from "${findTopicByKeyword(playlistIdeas, 'design') || relevantCourses[0]}"`,
      `Set up a learning schedule to work through these resources systematically`,
      `Document your progress and key takeaways from each resource`,
      `Apply these concepts in open source contributions related to ${desiredRole.toLowerCase()}`
    ];
    
    advice.push(actionItems.map(item => `• ${item}`).join('\n'));
    
    // SECTION 4: GitHub profile enhancement
    if (profile.insights.developmentSuggestions.length > 0 && 
        profile.insights.developmentSuggestions[0] !== 'Your GitHub profile looks great!') {
      advice.push(`**Enhance Your GitHub Presence**\nWhile learning, consider these profile improvements:`);
      
      advice.push(profile.insights.developmentSuggestions
        .map(suggestion => `• ${suggestion.toLowerCase()}`)
        .join('\n'));
    }
    
    // SECTION 5: Next steps based on contribution level
    const nextStepsTitle = contributionLevel === 'Getting Started' || contributionLevel === 'Moderately Active' 
      ? "**Growing Your Expertise**" 
      : "**Showcasing Your Expertise**";
    
    advice.push(nextStepsTitle);
    
    if (contributionLevel === 'Getting Started' || contributionLevel === 'Moderately Active') {
      const growthSteps = [
        `Start with smaller projects implementing concepts from "${relevantCourses[0]}"`,
        `Build your portfolio gradually with increasingly complex applications`,
        `Share your learning journey through blog posts or tech talks`
      ];
      advice.push(growthSteps.map(step => `• ${step}`).join('\n'));
    } else {
      const expertSteps = [
        `Create advanced projects demonstrating senior-level skills in ${desiredRole}`,
        `Consider mentoring others learning similar technologies`,
        `Contribute to or maintain open source projects related to these topics`
      ];
      advice.push(expertSteps.map(step => `• ${step}`).join('\n'));
    }
    
    // Return a cleaned-up, formatted response
    return advice.join('\n\n');
  };

  // Helper function to find relevant topics from the playlist based on user's experience
  const findRelevantTopics = (playlistIdeas, languages, desiredRole) => {
    const relevantTopics = [];
    const lowerRole = desiredRole.toLowerCase();
    
    playlistIdeas.forEach(topic => {
      const lowerTopic = topic.toLowerCase();
      
      // Check if topic matches user's languages
      const matchesLanguage = languages.some(lang => lowerTopic.includes(lang.toLowerCase()));
      
      // Check if topic matches desired role keywords
      const matchesRole = lowerTopic.includes(lowerRole) || 
                          (lowerRole.includes('python') && lowerTopic.includes('python')) ||
                          (lowerRole.includes('front') && (lowerTopic.includes('ui') || lowerTopic.includes('ux') || lowerTopic.includes('frontend'))) ||
                          (lowerRole.includes('back') && (lowerTopic.includes('server') || lowerTopic.includes('api') || lowerTopic.includes('backend')));
      
      if (matchesLanguage || matchesRole) {
        relevantTopics.push(topic);
      }
    });
    
    return relevantTopics.length > 0 ? relevantTopics : playlistIdeas;
  };
  
  // Helper function to find a topic by keyword
  const findTopicByKeyword = (playlistIdeas, keyword) => {
    const match = playlistIdeas.find(topic => topic.toLowerCase().includes(keyword.toLowerCase()));
    return match || playlistIdeas[0] || '';
  };
  
  // Helper function to find topics that align with the user's languages
  const findAlignedTopics = (languages, playlistIdeas) => {
    let alignments = [];
    
    languages.forEach(lang => {
      playlistIdeas.forEach(topic => {
        if (topic.toLowerCase().includes(lang.toLowerCase()) && !alignments.includes(topic)) {
          alignments.push(topic);
        }
      });
    });
    
    return alignments.length > 0 
      ? alignments.slice(0, Math.min(3, alignments.length))
      : playlistIdeas.slice(0, Math.min(3, playlistIdeas.length));
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const currentScroll = carouselRef.current.scrollLeft;
      carouselRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderMessage = (message, index) => {
    if (message.type === 'playlist-ideas') {
      return (
        <div key={index} className="bg-white shadow-sm rounded-lg p-4 max-w-[90%]">
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {message.content.map((idea, idx) => (
              <li key={idx}>{idea}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    if (message.type === 'github-profile') {
      // GitHub profile data preview - we show a compact version in the chat
      return (
        <div key={index} className="bg-white shadow-sm rounded-lg p-4 max-w-[90%] w-full mt-2">
          <div className="flex items-center border-b pb-3 mb-3">
            <img 
              src={message.content.avatar_url} 
              alt={`${message.content.login}'s avatar`} 
              className="w-10 h-10 rounded-full mr-3"
            />
            <div>
              <h4 className="font-medium">{message.content.name || message.content.login}</h4>
              <p className="text-xs text-gray-600">@{message.content.login}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-2">
            {message.content.insights.primaryLanguages.map(lang => (
              <span key={lang} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {lang}
              </span>
            ))}
          </div>
          
          <div className="text-sm italic text-gray-600">
            GitHub profile analyzed
          </div>
        </div>
      );
    }
    
    if (message.type === 'playlist') {
      return (
        <div key={index} className="bg-white shadow-sm rounded-lg p-4 max-w-[95%] w-full mt-2">
          <div className="relative">
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-sm hover:bg-gray-100 text-gray-700"
              aria-label="Previous videos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x scroll-smooth px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {message.content.videos?.map((video) => (
                <div key={video.id} className="flex-shrink-0 w-72 snap-start border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                  <h4 className="font-medium mb-2 text-sm line-clamp-2 h-10 text-gray-800">{video.title}</h4>
                  <div className="aspect-video mb-2 w-full rounded-md overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-md"
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-sm hover:bg-gray-100 text-gray-700"
              aria-label="Next videos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      );
    }
    
    // Handle formatted text with sections and bullet points
    if (message.content.includes('**') || message.content.includes('•')) {
      return (
        <div
          key={index}
          className={`p-4 rounded-lg ${
            message.role === 'user'
              ? 'bg-blue-100 ml-auto max-w-[80%]'
              : 'bg-white shadow-sm max-w-[80%]'
          }`}
        >
          <div className="formatted-text">
            {message.content.split('\n\n').map((paragraph, pIdx) => {
              // Handle section titles (bold text)
              if (paragraph.startsWith('**') && paragraph.includes('**\n')) {
                const [title, ...content] = paragraph.split('\n');
                return (
                  <div key={pIdx} className="mb-3">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {title.replace(/\*\*/g, '')}
                    </h4>
                    <div className="text-gray-700">
                      {content.join('\n')}
                    </div>
                  </div>
                );
              }
              
              // Handle bullet points
              if (paragraph.includes('• ')) {
                return (
                  <div key={pIdx} className="mb-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {paragraph.split('\n').map((line, lIdx) => (
                        <li key={lIdx} className="text-gray-700">
                          {line.replace('• ', '')}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              }
              
              // Regular paragraph
              return (
                <p key={pIdx} className="mb-3 text-gray-700">
                  {paragraph}
                </p>
              );
            })}
          </div>
        </div>
      );
    }
    
    // Default message rendering
    return (
      <div
        key={index}
        className={`p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-100 ml-auto max-w-[80%]'
            : 'bg-white shadow-sm max-w-[80%]'
        }`}
      >
        {message.content}
      </div>
    );
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
        style={{ minHeight: 'calc(100vh - 150px)' }}
      >
        <div className={`p-4 ${isInitialState ? 'h-full flex flex-col justify-end' : 'space-y-4'}`}>
          {isInitialState ? (
            <div className="bg-white shadow-sm rounded-lg p-3 max-w-[80%] mb-4">
              {messages[0].content}
            </div>
          ) : (
            <>
              {messages.map((message, index) => renderMessage(message, index))}
              {loading && (
                <div className="p-3 rounded-lg bg-white shadow-sm max-w-[80%]">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              )}
              {isSaving && (
                <div className="text-xs text-gray-400 text-center">Saving conversation...</div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSendMessage} className="p-3 flex border-t bg-white sticky bottom-20">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isInitialState ? "Type your desired role..." : "Type your message..."}
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          disabled={loading}
          autoFocus
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-r-lg bg-blue-500 text-white font-medium ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
} 