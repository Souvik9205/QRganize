import { CreateEvent, GetEvent } from "../types";
import { decodeToken } from "../utils/DecodeToken";
import prisma from "../utils/PrismaClient";

export const getEvent = async (
  token: string,
  eventId: string
): Promise<GetEvent> => {
  try {
    const id = decodeToken(token);
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        name: true,
        description: true,
        organization: true,
        dateTime: true,
        location: true,
        orgImgURL: true,
        createdById: true,
        createdAt: true,
        customFields: true,
      },
    });
    if (!event) {
      return {
        status: 404,
        data: {
          message: "Event not found",
          event: null,
        },
      };
    }
    return {
      status: 200,
      data: {
        message: null,
        event: {
          ...event,
          dateTime: event.dateTime.toISOString(),
          createdAt: event.createdAt.toISOString(),
        },
      },
    };
  } catch (error) {
    return {
      status: 500,
      data: {
        message: "Internal server error",
        event: null,
      },
    };
  }
};

export const createEvent = async (
  token: string,
  data: CreateEvent
): Promise<{
  status: number;
  data: {
    message: string;
    event: any | null;
  };
}> => {
  try {
    const id = decodeToken(token);
    if (!id) {
      return {
        status: 401,
        data: {
          message: "Unauthorized",
          event: null,
        },
      };
    }
    const dateTime = new Date(`${data.eventDate}T${data.eventTime}`);
    if (isNaN(dateTime.getTime())) {
      return {
        status: 400,
        data: {
          message: "Invalid date or time format",
          event: null,
        },
      };
    }
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });
    if (!user) {
      return {
        status: 404,
        data: {
          message: "User not found",
          event: null,
        },
      };
    }

    const event = await prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        organization: data.organization,
        dateTime: dateTime,
        location: data.location,
        orgImgURL: data.orgImgURL,
        createdById: id,
        customFields: {
          create:
            data.customFields?.map(
              (field: { fieldName: string; fieldType: string }) => ({
                fieldName: field.fieldName,
                fieldType: field.fieldType,
              })
            ) || [],
        },
      },
      include: {
        customFields: true,
      },
    });

    return {
      status: 201,
      data: {
        message: "Event created successfully",
        event,
      },
    };
  } catch (error) {
    return {
      status: 500,
      data: {
        message: "Internal server error",
        event: null,
      },
    };
  }
};

export const getUserEvent = async (eventId: string): Promise<GetEvent> => {
  try {
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        name: true,
        description: true,
        organization: true,
        dateTime: true,
        location: true,
        orgImgURL: true,
        createdById: true,
        createdAt: true,
        customFields: true,
      },
    });
    if (!event) {
      return {
        status: 404,
        data: {
          message: "Event not found",
          event: null,
        },
      };
    }
    return {
      status: 200,
      data: {
        message: null,
        event: {
          ...event,
          dateTime: event.dateTime.toISOString(),
          createdAt: event.createdAt.toISOString(),
        },
      },
    };
  } catch (error) {
    return {
      status: 500,
      data: {
        message: "Internal server error",
        event: null,
      },
    };
  }
};
