export async function POST(request) {
  try {
    const body = await request.json();
    const { username } = body;
    
    if (!username) {
      return Response.json({ success: false, message: 'Username is required' }, { status: 400 });
    }
    
    // Fetch basic user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`);
    if (!userRes.ok) {
      return Response.json(
        { success: false, message: 'GitHub user not found' }, 
        { status: userRes.status }
      );
    }
    const userData = await userRes.json();
    
    // Fetch repositories (limited to first 10 for performance)
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=10&sort=updated`);
    const reposData = await reposRes.json();
    
    // Prepare an enhanced profile with insights
    const profileWithInsights = {
      ...userData,
      repos: reposData.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        url: repo.html_url,
        updated_at: repo.updated_at
      })),
      insights: {
        primaryLanguages: getTopLanguages(reposData),
        contributionLevel: getContributionLevel(userData),
        focusAreas: getFocusAreas(reposData),
        developmentSuggestions: getDevelopmentSuggestions(userData, reposData)
      }
    };
    
    return Response.json({ success: true, profile: profileWithInsights });
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    return Response.json(
      { success: false, message: 'Failed to fetch GitHub data' }, 
      { status: 500 }
    );
  }
}

// Helper functions to generate insights
function getTopLanguages(repos) {
  const languages = {};
  repos.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }
  });
  
  return Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([language]) => language);
}

function getContributionLevel(userData) {
  const publicRepos = userData.public_repos || 0;
  
  if (publicRepos > 30) return 'Highly Active';
  if (publicRepos > 10) return 'Active';
  if (publicRepos > 5) return 'Moderately Active';
  return 'Getting Started';
}

function getFocusAreas(repos) {
  // Extract focus areas based on repository topics and descriptions
  const areas = new Set();
  
  repos.forEach(repo => {
    if (repo.description) {
      const description = repo.description.toLowerCase();
      
      if (description.includes('web') || description.includes('frontend') || description.includes('react') || 
          description.includes('vue') || description.includes('angular')) {
        areas.add('Web Development');
      }
      
      if (description.includes('machine learning') || description.includes('ai') || 
          description.includes('data science') || description.includes('ml')) {
        areas.add('AI/Machine Learning');
      }
      
      if (description.includes('mobile') || description.includes('android') || 
          description.includes('ios') || description.includes('flutter')) {
        areas.add('Mobile Development');
      }
      
      if (description.includes('backend') || description.includes('server') || 
          description.includes('api') || description.includes('database')) {
        areas.add('Backend Development');
      }
    }
  });
  
  return Array.from(areas).length > 0 ? Array.from(areas) : ['Not enough information'];
}

function getDevelopmentSuggestions(userData, repos) {
  const suggestions = [];
  
  // Based on public repos count
  if (userData.public_repos < 5) {
    suggestions.push('Create more public repositories to showcase your skills');
  }
  
  // Based on bio
  if (!userData.bio) {
    suggestions.push('Add a bio to your GitHub profile');
  }
  
  // Based on languages
  const languages = getTopLanguages(repos);
  if (languages.length < 2) {
    suggestions.push('Diversify your portfolio with projects in different programming languages');
  }
  
  // Based on README profiles
  const hasReadmeProfile = repos.some(repo => repo.name === userData.login);
  if (!hasReadmeProfile) {
    suggestions.push('Create a GitHub profile README to introduce yourself');
  }
  
  return suggestions.length > 0 ? suggestions : ['Your GitHub profile looks great!'];
} 