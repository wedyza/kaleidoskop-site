from receiver.serializers import RemainsReceiveSerializer

class RemainsRepository:
    def save_remains(self, data = dict[str, str]):
        remains = RemainsReceiveSerializer(data = data, many=True)
        if remains.is_valid():
        # remains.is_valid(raise_exception=True)
            remains.save()
        else:
            # print(remains.error_messages)
            print(remains.errors)
        #     pass # Тут вывести лог