// App.tsx - Verifique se este bloco está completo e fechado
      <Sidebar 
        currentView={view} 
        onChangeView={setView} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        hasAnalysis={!!analysisResult}
        user={user}
        onLogout={handleLogout}
      /> // <--- ESTE "/>" ESTAVA FALTANDO OU FOI CORTADO

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 md:ml-64 min-h-screen flex flex-col relative`}>
        {/* ... Restante do Main ... */}
