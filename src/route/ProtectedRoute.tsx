import React, { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import TaskService from '../services/task.service';

export const ProjectRouteGuard = () => {
  const { id } = useParams<{ id: string }>();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const verifyAccess = async () => {
      if (!id) {
        if (isMounted) setHasAccess(false);
        return;
      }

      try {
        await TaskService.getTaskListsByProject(Number(id));
        if (isMounted) setHasAccess(true);
      } catch (err: any) {
        console.error("ACCESS DENIED", err?.response?.status, err?.response?.data);

        if (isMounted) setHasAccess(false);
      }
    };

    verifyAccess();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (hasAccess === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  //   if (!hasAccess) {
  //     return <Navigate to="/projects" replace />;
  //   }

  return <Outlet />;
};

export default ProjectRouteGuard;